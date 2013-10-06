#!/bin/bash
bundle install
rake db:migrate
bundle exec rails server -p 3000
