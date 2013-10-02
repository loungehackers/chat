class CreateLoungechats < ActiveRecord::Migration
  def change
    create_table :loungechats do |t|

      t.timestamps
    end
  end
end
