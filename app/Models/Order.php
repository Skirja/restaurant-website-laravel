<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory, HasUuids;

    const TYPE_DINE_IN = 'dine-in';
    const TYPE_TAKEAWAY = 'takeaway';
    const TYPE_DELIVERY = 'delivery';

    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'order_type',
        'status',
        'total_amount',
        'payment_status',
        'payment_method',
        'payment_token',
        'payment_url',
        'transaction_id',
        'estimated_delivery_time',
        'pickup_time',
        'pickup_date',
        'delivery_address',
        'customer_name',
        'customer_email',
        'customer_phone',
        'notes',
        'discount_code',
        'discount_amount'
    ];

    protected $casts = [
        'pickup_date' => 'datetime',
        'estimated_delivery_time' => 'string',
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2'
    ];

    public static function getOrderTypes(): array
    {
        return [
            self::TYPE_DINE_IN,
            self::TYPE_TAKEAWAY,
            self::TYPE_DELIVERY,
        ];
    }

    public static function getOrderStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_PROCESSING,
            self::STATUS_COMPLETED,
            self::STATUS_CANCELLED,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
