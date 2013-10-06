#!/bin/bash

# Take down current process
cat tmp/pids/server.pid | xargs kill -9

# Install and remove gems
bundle install

# Run migrations
rake db:migrate

# Start up new process
bundle exec rails server -p 3000
