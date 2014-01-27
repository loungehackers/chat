# encoding: UTF-8
require "cgi"
class User < ActiveRecord::Base
	def self.create_with_omniauth(auth)
		create! do |user|
			puts "creating new user"
			user.provider = CGI::escapeHTML(auth["provider"].force_encoding(Encoding::UTF_8))
			user.uid = auth["uid"]
			user.name = CGI::escapeHTML(auth["info"]["name"].force_encoding(Encoding::UTF_8))
		end
	end

	def self.update_with_omniauth(user, auth)
		name = CGI::escapeHTML(auth["info"]["name"].force_encoding(Encoding::UTF_8))
		user.update(name: name)
	end

end
