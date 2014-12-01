LoungeChat2::Application.routes.draw do
  match "/auth/:provider/callback" => "sessions#create", via: [:get, :post]
  match "/signout" => "sessions#destroy", :as => :signout, via: [:get, :post]
  get "/login" => "loungechats#login"
  get "/assets/libs/jquery.min.map", to: proc { [404, {}, ['']] }
  get '/chat' => 'loungechats#chat'

  # You can have the root of your site routed with "root"
  root 'loungechats#index'

  match "*path", to: redirect("/"), via: :all
end
