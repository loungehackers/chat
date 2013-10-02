require 'test_helper'

class LoungechatsControllerTest < ActionController::TestCase
  setup do
    @loungechat = loungechats(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:loungechats)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create loungechat" do
    assert_difference('Loungechat.count') do
      post :create, loungechat: {  }
    end

    assert_redirected_to loungechat_path(assigns(:loungechat))
  end

  test "should show loungechat" do
    get :show, id: @loungechat
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @loungechat
    assert_response :success
  end

  test "should update loungechat" do
    patch :update, id: @loungechat, loungechat: {  }
    assert_redirected_to loungechat_path(assigns(:loungechat))
  end

  test "should destroy loungechat" do
    assert_difference('Loungechat.count', -1) do
      delete :destroy, id: @loungechat
    end

    assert_redirected_to loungechats_path
  end
end
