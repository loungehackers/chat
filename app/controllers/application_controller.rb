require 'dotenv'
Dotenv.load

class ApplicationController < ActionController::Base
	# Prevent CSRF attacks by raising an exception.
	# For APIs, you may want to use :null_session instead.
	protect_from_forgery with: :exception

	helper_method :current_user

	# before_filter :content_security_policy_headers

	private
	def current_user
		@current_user ||= User.find(session[:user_id]) if session[:user_id]
	end

	private
	def content_security_policy_headers
		if ENV['loungechat_force_ssl'] == "true" then
			wsScheme = "wss"
		else
			wsScheme = "ws"
		end
		wsPolicy = wsScheme + "://" + ENV['loungechat_hostname'] + "/chat"


		response.headers["X-Frame-Options"] = "DENY";
		contentSecurityPolicy = "connect-src " + wsPolicy + "; default-src 'self'"
		response.headers["Content-Security-Policy"] = contentSecurityPolicy;
		response.headers["X-Content-Security-Policy"] = contentSecurityPolicy;
		response.headers["X-Webkit-CSP"] = contentSecurityPolicy;		
	end
end
