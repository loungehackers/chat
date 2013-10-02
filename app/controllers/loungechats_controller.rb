class LoungechatsController < ApplicationController
  before_action :set_loungechat, only: [:show, :edit, :update, :destroy]

  # GET /loungechats
  # GET /loungechats.json
  def index
    @loungechats = Loungechat.all
  end

  # GET /loungechats/1
  # GET /loungechats/1.json
  def show
  end

  # GET /loungechats/new
  def new
    @loungechat = Loungechat.new
  end

  # GET /loungechats/1/edit
  def edit
  end

  # POST /loungechats
  # POST /loungechats.json
  def create
    @loungechat = Loungechat.new(loungechat_params)

    respond_to do |format|
      if @loungechat.save
        format.html { redirect_to @loungechat, notice: 'Loungechat was successfully created.' }
        format.json { render action: 'show', status: :created, location: @loungechat }
      else
        format.html { render action: 'new' }
        format.json { render json: @loungechat.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /loungechats/1
  # PATCH/PUT /loungechats/1.json
  def update
    respond_to do |format|
      if @loungechat.update(loungechat_params)
        format.html { redirect_to @loungechat, notice: 'Loungechat was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @loungechat.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /loungechats/1
  # DELETE /loungechats/1.json
  def destroy
    @loungechat.destroy
    respond_to do |format|
      format.html { redirect_to loungechats_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_loungechat
      @loungechat = Loungechat.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def loungechat_params
      params[:loungechat]
    end
end
