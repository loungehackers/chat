# encoding: UTF-8
class User < ActiveRecord::Base
	def self.create_with_omniauth(auth)
		create! do |user|
			puts "creating new user"
			user.provider = auth["provider"].encode!('UTF-8', 'ISO-8859-1', :invalid => :replace)
			user.uid = auth["uid"]
			user.name = auth["info"]["name"].encode!('UTF-8', 'ISO-8859-1', :invalid => :replace)

		end
	end
	
end
