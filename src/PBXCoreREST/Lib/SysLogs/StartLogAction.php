<?php

/*
 * MikoPBX - free phone system for small business
 * Copyright © 2017-2024 Alexey Portnov and Nikolay Beketov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

namespace MikoPBX\PBXCoreREST\Lib\SysLogs;

use MikoPBX\Core\System\Directories;
use MikoPBX\Core\System\Network;
use MikoPBX\Core\System\Processes;
use MikoPBX\Core\System\Util;
use MikoPBX\PBXCoreREST\Lib\PBXApiResult;
use Phalcon\Di\Injectable;

/**
 * Starts the collection of logs and captures TCP packets.
 *
 * @package MikoPBX\PBXCoreREST\Lib\SysLogs
 */
class StartLogAction extends Injectable
{
    /**
     * Starts the collection of logs and captures TCP packets.
     *
     * @return PBXApiResult An object containing the result of the API call.
     */
    public static function main(): PBXApiResult
    {
        $res = new PBXApiResult();
        $res->processor = __METHOD__;
        $logDir = Directories::getDir(Directories::CORE_LOGS_DIR);

        // TCP dump
        $tcpDumpDir = "$logDir/tcpDump";
        Util::mwMkdir($tcpDumpDir);
        $network = new Network();
        $arr_eth = $network->getInterfacesNames();
        $tcpdump = Util::which('tcpdump');
        $timeout = 300;
        foreach ($arr_eth as $eth) {
            Processes::mwExecBgWithTimeout(
                "$tcpdump -i $eth -n -s 0 -vvv -w $tcpDumpDir/$eth.pcap",
                $timeout,
                "$tcpDumpDir/{$eth}_out.log"
            );
        }
        $res->success = true;

        return $res;
    }
}
