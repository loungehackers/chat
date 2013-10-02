json.array!(@loungechats) do |loungechat|
  json.extract! loungechat, 
  json.url loungechat_url(loungechat, format: :json)
end
