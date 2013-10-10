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
			redis_thread = Thread.new do
				Redis.new.subscribe "chat" do |on|
					on.message do |channel, message|
						tubesock.send_data message
					end
				end
			end

			puts "username: " << current_user.name
			Redis.new.sadd("chatusers", current_user.name)
			message = "[LH:login]" + current_user.name + ":" + Redis.new.smembers("chatusers").to_s
			puts message
			Redis.new.publish "chat", message


			tubesock.onmessage do |m|
				Redis.new.publish "chat", m
			end

			tubesock.onclose do
				Redis.new.srem("chatusers", current_user.name)
				message = "[LH:logout]" + current_user.name + ":" + Redis.new.smembers("chatusers").to_s
				puts message
				Redis.new.publish "chat", message
				redis_thread.kill
			end
		end
	end
end
