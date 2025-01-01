<?php

namespace Database\Seeders;

use App\Models\Table;
use Illuminate\Database\Seeder;

class TableSeeder extends Seeder
{
    public function run(): void
    {
        $tables = [
            ['table_number' => 1, 'capacity' => 2, 'status' => Table::STATUS_AVAILABLE],
            ['table_number' => 2, 'capacity' => 2, 'status' => Table::STATUS_AVAILABLE],
            ['table_number' => 3, 'capacity' => 4, 'status' => Table::STATUS_AVAILABLE],
            ['table_number' => 4, 'capacity' => 4, 'status' => Table::STATUS_AVAILABLE],
            ['table_number' => 5, 'capacity' => 6, 'status' => Table::STATUS_AVAILABLE],
            ['table_number' => 6, 'capacity' => 6, 'status' => Table::STATUS_AVAILABLE],
            ['table_number' => 7, 'capacity' => 8, 'status' => Table::STATUS_AVAILABLE],
            ['table_number' => 8, 'capacity' => 8, 'status' => Table::STATUS_AVAILABLE],
            ['table_number' => 9, 'capacity' => 10, 'status' => Table::STATUS_AVAILABLE],
            ['table_number' => 10, 'capacity' => 10, 'status' => Table::STATUS_AVAILABLE],
        ];

        foreach ($tables as $table) {
            Table::create($table);
        }
    }
}
