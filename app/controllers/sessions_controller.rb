class SessionsController < ApplicationController
	
	def create
		puts "entered sessions create"
		auth = request.env["omniauth.auth"]
		user = User.find_by_provider_and_uid(auth["provider"], auth["uid"])

		if user 
			puts "trying to update name"
			puts auth["name"]
			User.update_with_omniauth(user, auth)
			user = User.find_by_provider_and_uid(auth["provider"], auth["uid"])
		else
			puts "creaet new user"
			user = User.create_with_omniauth(auth)
		end
		
		session[:user_id] = user.id
		redirect_to root_url, :notice => "Signed in!"
	end

	def destroy
		puts "killing session"
		reset_session
		redirect_to root_url, :notice => "Signed out!"
	end

end
