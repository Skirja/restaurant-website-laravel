<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('menu_item_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });

        // Add trigger to update stock_quantity
        DB::unprepared('
            CREATE TRIGGER update_stock_after_order_payment
            AFTER UPDATE ON orders
            WHEN NEW.payment_status = "success" AND OLD.payment_status != "success"
            BEGIN
                UPDATE menu_items
                SET stock_quantity = stock_quantity - (
                    SELECT quantity 
                    FROM order_items 
                    WHERE order_items.menu_item_id = menu_items.id 
                    AND order_items.order_id = NEW.id
                )
                WHERE id IN (
                    SELECT menu_item_id 
                    FROM order_items 
                    WHERE order_id = NEW.id
                );
            END
        ');
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS update_stock_after_order_payment');
        Schema::dropIfExists('order_items');
    }
};
