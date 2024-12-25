<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'email',
        'position',
        'department',
        'hire_date',
        'out_date',
        'status',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'out_date' => 'date',
    ];

    public function getRouteKeyName()
    {
        return 'id';
    }

    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isInactive()
    {
        return $this->status === 'inactive';
    }

    public function isTerminated()
    {
        return $this->status === 'terminated';
    }
}
