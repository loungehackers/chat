source 'https://rubygems.org'
ruby '2.0.0'

############################
## RAILS standard section ##
############################
# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '>= 4.0.0'

# Use sqlite3 as the database for Active Record
gem 'sqlite3', group: :development
gem 'pg', group: :production

# Use SCSS for stylesheets
gem 'sass-rails', '>= 4.0.0'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# Use CoffeeScript for .js.coffee assets and views
gem 'coffee-rails', '>= 4.0.0'

# Use jquery as the JavaScript library
gem 'jquery-rails'

# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '>= 1.2'

##########################
## APP specific section ##
##########################
# Meetup APIs for omniauth and regular API-access
gem 'omniauth-meetup'
gem 'rMeetup'

# Read stored config values from .env-file.
gem 'dotenv-rails'

# Use puma as the app server
gem 'puma'

# Use redis for in memory message processing.
gem 'redis'

# Use tubesock for websockets, my own fork handles network issues more smoothly.
gem 'tubesock', :git => 'git@github.com:StefanWallin/tubesock.git', :branch => 'exception_handling'

# Useful for debugging stuff.
gem 'pry'


############################
## Special groups section ##
############################

group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'sdoc', require: false
end

group :production do
	gem 'rails_12factor'
	gem 'rails_serve_static_assets'
end

group :development do
    gem 'capistrano',         require: false
    gem 'capistrano-rvm',     require: false
    gem 'capistrano-rails',   require: false
    gem 'capistrano-bundler', require: false
    gem 'capistrano3-puma',   require: false
end

