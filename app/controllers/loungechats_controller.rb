require "cgi"
class LoungechatsController < ApplicationController
	@@num_history_lines = 50
	# GET /loungechats
	def index
		redirect_to login_path unless current_user


		#TODO: validate user belonging through rMeetup
		#STHLM id: 4019872
		#SVALL id: 6849142

	end

	# GET /login
	def login

	end

	include Tubesock::Hijack    

	def chat
		hijack do |tubesock|

			# Set up so we can send messages to this chat client.
			client_thread = Thread.new do
				Redis.new.subscribe "chat" do |on|
					on.message do |channel, message|
						tubesock.send_data message
					end
				end
			end

			if not current_user
				# User not properly authed
				session.destroy
				client_thread.kill
			else
				puts current_user.name + " has joined";
				# Loading history
				for i in 0..@@num_history_lines
					message = Redis.new.lindex("history", @@num_history_lines-i)
					
					# Sending over socket instead of publishing, otherwise
					# everyone would get history when a new user joins.
					tubesock.send_data "[LH:history]#{message}" if message
				end

				# Adding username to list of users & publishing join.
				Redis.new.sadd("chatusers", current_user.name)
				message = "[LH:login]#{current_user.name}:#{Redis.new.smembers("chatusers").to_s}"
				Redis.new.publish "chat", message

				# Registering this socket to listen on messages from the client.
				tubesock.onmessage do |messageFromClient|
					if current_user.nil?
						puts "user didn't notice it had timed out"
					else
						#Sanitizing the message
						messageFromClient.force_encoding(Encoding::UTF_8)
						message = CGI::escapeHTML("#{current_user.name}: #{messageFromClient}")

						# Publishing the message to the chat room
						Redis.new.publish "chat", message

						# Saving message in the history
						Redis.new.lpush("history", message)
						Redis.new.ltrim("history", 0, @@num_history_lines)
					end
				end

				# Clean up after logout or timeout.
				tubesock.onclose do |closeCause|
					closeCause = "unknown" if closeCause.nil?
					if current_user.nil? or tubesock.nil? or tubesock.closed?
						puts "already closed #{closeCause}"
					else
						name = current_user.name
						puts "#{current_user.name} exited with '#{closeCause}'"
						current_user = nil
						session.destroy
						client_thread.kill
						Redis.new.srem("chatusers", name)
						message = "[LH:logout]#{name}:#{Redis.new.smembers("chatusers").to_s}"
						Redis.new.publish "chat", message
					end
				end
			end
		end
	end
end
