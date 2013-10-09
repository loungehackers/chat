LoungeChat2::Application.routes.draw do
  match "/auth/:provider/callback" => "sessions#create", via: [:get, :post]
  match "/signout" => "sessions#destroy", :as => :signout, via: [:get, :post]
  match "/login" => "loungechats#login", via: :get

  get '/chat' => 'loungechats#chat'

  # You can have the root of your site routed with "root"
  root 'loungechats#index'
end
