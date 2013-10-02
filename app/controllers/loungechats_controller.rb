class LoungechatsController < ApplicationController

  # GET /loungechats
  def index
    redirect_to login_path unless current_user
  end

  # GET /login
  def login

  end
end
