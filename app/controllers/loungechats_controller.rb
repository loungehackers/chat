require 'cgi'
require 'digest/sha1'
class LoungechatsController < ApplicationController
	@@num_history_lines = 50
	@@debug = true
	# GET /loungechats
	def index
		redirect_to login_path unless current_user


		#TODO: validate user belonging through rMeetup
		#STHLM id: 4019872
		#SVALL id: 6849142

	end

	# GET /lab
	def lab
		puts response.headers
	end

	# GET /login
	def login

	end

	include Tubesock::Hijack

	def chat
		hijack do |tubesock|
			my_socket_string = current_user.uid.to_s + Time.now.to_i.to_s
			my_socket_hash = Digest::SHA1.hexdigest(my_socket_string)

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
				puts current_user.name + " has joined with socket " + my_socket_hash if @@debug

				# Give new user information about rooms
				publish_joined_rooms(tubesock)

				# Loading history and pushing to newly joined user
				publish_history(tubesock)

				# Adding username to list of users & publishing join.
				handle_join
				publish_join

				attach_socket_handlers(tubesock, client_thread)
			end
		end
	end

	private
		def publish_joined_rooms(tubesock)
			# TODO: map to room storage in Redis.
			if tubesock
				message = {
					:rooms => {
						0 => 'main'
					}
				}

				# Sending over socket instead of publishing, otherwise
				# everyone would get what rooms this user is joined to.
				tubesock.send_data message.to_json
			end
		end

		def publish_history(tubesock)
			if tubesock
				for i in 0..@@num_history_lines
					message = Redis.new.lindex("history", @@num_history_lines-i)

					# Sending over socket instead of publishing, otherwise
					# everyone would get history when a new user joins.

					# Since the data in redis is already converted to json we
					# don't convert it before we send down the tube
					tubesock.send_data message if message
				end
			end
		end

		def publish_join()
			# TODO: Change so that login publishes
			members = Redis.new.smembers("chatusers").to_a
			message = {
				:type => "login",
				:my_uid => current_user.uid,
				:members => members
			}
			Redis.new.publish "chat", message.to_json

		end

		def handle_join()
			Redis.new.sadd("chatusers", current_user.name)
		end

		def compose_message(messageFromClient, current_user)
			messageFromClient.force_encoding(Encoding::UTF_8)
			message = {
				:type => "message",
				:content => CGI::escapeHTML(messageFromClient),
				:user_id => current_user.uid,
				:timestamp => Time.now.to_i,
				:room => 0
			}
			return message
		end

		def save_message_to_history
			# Change type of message, since it's no longer a live message.
			message[:type] = "history"
			Redis.new.lpush("history", message.to_json)
			Redis.new.ltrim("history", 0, @@num_history_lines)
		end

		def attach_socket_handlers(tubesock, client_thread)
			# Registering this socket to listen on messages from the client.
			tubesock.onmessage do |messageFromClient|
				if current_user.nil?
					puts "user didn't notice it had timed out" if @@debug
				else
					#Sanitizing the message
					message = compose_message(messageFromClient, current_user)

					# Publishing the message to the chat room
					Redis.new.publish "chat", message.to_json

					# Saving message in the history
					save_message_to_history(message)
				end
			end

			# Clean up after logout or timeout.
			tubesock.onclose do |closeCause|
				closeCause = "unknown" if closeCause.nil?
				if current_user.nil? or tubesock.nil? or tubesock.closed?
					puts "already closed #{closeCause}" if @@debug
				else
					message = {
						:type => "logout",
						:uid => current_user.uid
					}
					name = current_user.name
					puts "#{current_user.name} exited with '#{closeCause}'" if @@debug
					current_user = nil
					session.destroy
					client_thread.kill
					Redis.new.srem("chatusers", name)
					Redis.new.publish "chat", message.to_json
				end
			end
		end
		# Private double indent
end
