Application state
=================
THIS APPLICATION IS NOT YET IN A USABLE STATE!

Lounge Chat
===========
This is a(supposed to become) rails application with a jabber backend where
users can create project ideas, vote for them and assign them selves as
contributors to a project.

Each project should get a chat channel which is logged into the project git
repository.

Login to the server should be authorized via the Meetup API, each user must
be a member of a authorized meetup group.



Code style
==========
Since the Ruby Community is a tad anal about using 2 spaces for indentation,
and I'm anal about using tabs instead. So if you're like me you want to make
everyone happy including yourself, be sure to make sure  you have to set up
this repo as follows:

<pre><code>  $ cat .git/info/attributes
  *.rb	filter=tabspace
  $ git config --global filter.tabspace.smudge=unexpand --tabs=2 --first-only
  $ git config --global filter.tabspace.clean=expand --tabs=2 --initial</code></pre>


Setup the application
=====================
Create a file '.env' in the root of the application with the following key value pairs:
<pre><code>  meetup_api_key= [obtain from meetup.com]
  meetup_api_secret= [obtain from meetup.com]
  secret_key_base= [128 character random key]</code></pre>

Then just run bundle, run the migrations and start the rails server
<pre><code>  $ bundle install
  $ rake db:migrate
  $ bundle exec rails server -p 3000</code></pre>

Now you'll have a local instance running on port 3000