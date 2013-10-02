require 'dotenv'
Dotenv.load

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :meetup, ENV['meetup_api_key'], ENV['meetup_api_secret']
end