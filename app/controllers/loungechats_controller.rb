require "cgi"
class LoungechatsController < ApplicationController

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
			client_thread = Thread.new do
				Redis.new.subscribe "chat" do |on|
					on.message do |channel, message|
						message.encode!('UTF-16', :undef => :replace, :invalid => :replace, :replace => "")
						tubesock.send_data message
					end
				end
			end

			if not current_user
				puts "not authed"
				client_thread.kill
				puts "redis thread killed"
			else		
				puts "authed"
				puts "username: " << current_user.name
				Redis.new.sadd("chatusers", current_user.name)
				message = "[LH:login]" + current_user.name + ":" + Redis.new.smembers("chatusers").to_s
				puts message
				Redis.new.publish "chat", message

				tubesock.onmessage do |messageFromClient|
					message = current_user.name + ": " + messageFromClient
					Redis.new.publish "chat", CGI::escapeHTML(message)
				end

				tubesock.onclose do
					Redis.new.srem("chatusers", current_user.name)
					message = "[LH:logout]" + current_user.name + ":" + Redis.new.smembers("chatusers").to_s
					puts message
					Redis.new.publish "chat", message
					client_thread.kill
				end
			end
		end
	end
end
