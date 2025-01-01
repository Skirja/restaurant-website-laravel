<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    use HasFactory, HasUuids;

    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_COMPLETED = 'completed';
    const STATUS_NO_SHOW = 'no_show';

    const VALID_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_CONFIRMED,
        self::STATUS_CANCELLED,
        self::STATUS_COMPLETED,
        self::STATUS_NO_SHOW
    ];

    protected $fillable = [
        'user_id',
        'table_id',
        'payment_id',
        'reservation_date',
        'reservation_time',
        'number_of_guests',
        'status',
        'special_requests',
        'cancelled_at',
        'cancellation_reason',
        'is_refunded'
    ];

    protected $casts = [
        'reservation_date' => 'date',
        'reservation_time' => 'datetime',
        'cancelled_at' => 'datetime',
        'is_refunded' => 'boolean'
    ];

    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_CONFIRMED,
            self::STATUS_CANCELLED,
        ];
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isConfirmed(): bool
    {
        return $this->status === self::STATUS_CONFIRMED;
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED]) &&
            $this->reservation_date->isAfter(now());
    }

    public function cancel(string $reason = null): void
    {
        if (!$this->canBeCancelled()) {
            throw new \Exception('Reservasi tidak dapat dibatalkan.');
        }

        $this->update([
            'status' => self::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason
        ]);
    }

    public function markAsCompleted(): void
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
    }

    public function markAsNoShow(): void
    {
        $this->update(['status' => self::STATUS_NO_SHOW]);
    }

    public function confirm(): void
    {
        $this->update(['status' => self::STATUS_CONFIRMED]);
    }

    public function isUpcoming(): bool
    {
        return $this->status === self::STATUS_CONFIRMED &&
            $this->reservation_date->isAfter(now());
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($reservation) {
            if (!$reservation->status) {
                $reservation->status = self::STATUS_PENDING;
            }
        });

        static::updating(function ($reservation) {
            if ($reservation->isDirty('status')) {
                if ($reservation->status === self::STATUS_CONFIRMED) {
                    Table::where('id', $reservation->table_id)
                        ->update(['status' => Table::STATUS_RESERVED]);
                } elseif ($reservation->status === self::STATUS_CANCELLED) {
                    Table::where('id', $reservation->table_id)
                        ->update(['status' => Table::STATUS_AVAILABLE]);
                }
            }
        });
    }
}
