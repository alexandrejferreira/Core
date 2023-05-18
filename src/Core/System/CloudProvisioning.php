<?php
/*
 * MikoPBX - free phone system for small business
 * Copyright © 2017-2021 Alexey Portnov and Nikolay Beketov
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

namespace MikoPBX\Core\System;

use MikoPBX\Common\Models\LanInterfaces;
use MikoPBX\Common\Models\PbxSettings;
use MikoPBX\Core\System\Configs\SSHConf;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp;

/**
 * Class CloudProvisioning
 *
 * Handles the provisioning process for cloud solutions.
 *
 * @package MikoPBX\Core\System
 */
class CloudProvisioning
{
    public const PBX_SETTING_KEY = 'CloudProvisioning';
    public const HTTP_TIMEOUT = 10;

    /**
     * Starts the cloud provisioning process.
     */
    public static function start():void
    {
        if(PbxSettings::findFirst('key="'.self::PBX_SETTING_KEY.'"')){
            // Already processed before.
            return;
        }
        $cp = new self();
        $solutions = ['google', 'mcs', 'azure'];
        $resultProvisioning = '0';
        foreach ($solutions as $solution){
            $methodName = "{$solution}Provisioning";
            if(!method_exists($cp, $methodName)){
                continue;
            }
            Util::sysLogMsg(__CLASS__, "Try $solution provisioning... ");
            if($cp->$methodName()){
                $resultProvisioning = '1';
                Util::sysLogMsg(__CLASS__, "$solution provisioning OK... ");
                break;
            }
        }
        $cp->updatePbxSettings(self::PBX_SETTING_KEY, $resultProvisioning);
        if($resultProvisioning === '1'){
            // Enable firewall.
            $cp->updatePbxSettings('PBXFirewallEnabled', '1');
            $cp->updatePbxSettings('PBXFail2BanEnabled', '1');
            $cp->checkConnectStorage();
        }
    }

    /**
     * Checks and connects the storage disk automatically.
     */
    private function checkConnectStorage():void{
        $phpPath = Util::which('php');
        Processes::mwExec($phpPath.' -f /etc/rc/connect.storage auto');
    }

    /**
     * Updates the SSH password.
     */
    private function updateSshPassword():void{
        $data = 'S'.md5(time());
        $this->updatePbxSettings('SSHPassword', $data);
        $this->updatePbxSettings('SSHDisablePasswordLogins', '1');
        $confSsh = new SSHConf();
        $confSsh->updateShellPassword();
    }

    /**
     * Updates the PBX settings with the provided key and data.
     *
     * @param string $keyName The key name.
     * @param mixed $data The data to be stored.
     */
    private function updatePbxSettings(string $keyName, $data):void{
        $setting = PbxSettings::findFirst('key="'.$keyName.'"');
        if(!$setting){
            $setting = new PbxSettings();
            $setting->key = $keyName;
        }
        $setting->value = $data;
        $result = $setting->save();
        if($result){
            Util::sysLogMsg(__CLASS__, "Update $keyName ... ");
        }else{
            Util::sysLogMsg(__CLASS__, "FAIL Update $keyName ... ");
        }
        unset($setting);
    }


    /**
     * Updates the SSH keys.
     *
     * @param string $data The SSH keys data.
     */
    private function updateSSHKeys(string $data):void{
        if(empty($data)){
            return;
        }
        $arrData = explode(':', $data);
        if(count($arrData) === 2){
            $data = $arrData[1];
        }
        $this->updatePbxSettings('SSHAuthorizedKeys', $data);
    }

    /**
     * Updates the LAN settings.
     *
     * @param string $hostname The hostname.
     * @param string $extipaddr The external IP address.
     */
    private function updateLanSettings(string $hostname, string $extipaddr):void{
        /** @var LanInterfaces $lanData */
        $lanData = LanInterfaces::findFirst();
        if($lanData){
            if(!empty($extipaddr)){
                $lanData->extipaddr = $extipaddr;
                $lanData->topology  = 'private';
            }
            if(!empty($hostname)){
                $lanData->hostname  = $hostname;
            }
            $result = $lanData->save();
            if($result){
                Util::sysLogMsg(__CLASS__, 'Update LAN... '.$hostname.'  '. $extipaddr);
            }else{
                Util::sysLogMsg(__CLASS__, 'FAIL Update LAN... '.$hostname.'  '. $extipaddr);
            }
        }else{
            Util::sysLogMsg(__CLASS__, 'LAN not found... '.$hostname.'  '. $extipaddr);
        }
    }

    /**
     * Performs the Google Cloud provisioning.
     * Google Cloud / Yandex Cloud.
     *
     * @return bool True if the provisioning was successful, false otherwise.
     */
    public function googleProvisioning():bool
    {
        $curl    = curl_init();
        $url     = 'http://169.254.169.254/computeMetadata/v1/instance/?recursive=true';
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_TIMEOUT, self::HTTP_TIMEOUT);
        curl_setopt($curl, CURLOPT_HTTPHEADER, ['Metadata-Flavor:Google']);
        $resultRequest = curl_exec($curl);

        $http_code     = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        if($http_code !== 200 ){
            return false;
        }
        $data = json_decode($resultRequest, true);
        $this->updateSSHKeys($data['attributes']['ssh-keys']??'');
        $hostname = $data['name']??'';
        $extIp= $data['networkInterfaces'][0]['accessConfigs'][0]['externalIp']??'';
        $this->updateLanSettings($hostname, $extIp);
        $this->updateSshPassword();
        $this->updateWebPassword($data['id']??'');
        return true;
    }

    /**
     * Retrieves metadata from the MCS endpoint.
     *
     * @param string $url The URL of the metadata endpoint.
     * @return string The response body.
     */
    private function getMetaDataMCS(string $url):string
    {
        $baseUrl = 'http://169.254.169.254/latest/meta-data/';
        $client  = new GuzzleHttp\Client();
        $headers = [];
        $params  = [];
        $options = [
            'timeout' => self::HTTP_TIMEOUT,
            'http_errors' => false,
            'headers' => $headers
        ];

        $url = "$baseUrl/$url?".http_build_query($params);
        try {
            $res    = $client->request('GET', $url, $options);
            $code   = $res->getStatusCode();
        }catch (GuzzleHttp\Exception\ConnectException $e ){
            $code = 0;
        } catch (GuzzleException $e) {
            $code = 0;
        }
        $body = '';
        if($code === 200 && isset($res)){
            $body = $res->getBody()->getContents();
        }
        return $body;
    }

    /**
     * Performs the Mail (VK) Cloud Solutions provisioning.
     *
     * @return bool True if the provisioning was successful, false otherwise.
     */
    public function mcsProvisioning():bool
    {
        // Имя сервера.
        $hostname = $this->getMetaDataMCS('hostname');
        if(empty($hostname)){
            return false;
        }
        $extIp    = $this->getMetaDataMCS('public-ipv4');
        // Получим ключи ssh.
        $sshKey   = '';
        $sshKeys  = $this->getMetaDataMCS('public-keys');
        $sshId    = explode('=', $sshKeys)[0]??'';
        if($sshId !== ''){
            $sshKey = $this->getMetaDataMCS("public-keys/$sshId/openssh-key");
        }
        $this->updateSSHKeys($sshKey);
        $this->updateLanSettings($hostname, $extIp);
        $this->updateSshPassword();

        $webPassword = $this->getMetaDataMCS('instance-id');
        $this->updateWebPassword($webPassword);

        return true;
    }

    /**
     * Updates the web password based on the instance name and ID.
     *
     * @param string $webPassword The web password.
     */
    private function updateWebPassword($webPassword):void
    {
        if(empty($webPassword)){
            return;
        }
        $this->updatePbxSettings('WebAdminPassword',$webPassword);
        $this->updatePbxSettings('CloudInstanceId', $webPassword);
    }

    /**
     * Performs the Azure Cloud provisioning.
     *
     * @return bool True if the provisioning was successful, false otherwise.
     */
    public function azureProvisioning():bool
    {
        $baseUrl = 'http://168.63.129.16/machine';
        $curl = curl_init();
        $url  = "{$baseUrl}?comp=goalstate";
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_TIMEOUT, self::HTTP_TIMEOUT);
        curl_setopt($curl, CURLOPT_HTTPHEADER, ['x-ms-version: 2012-11-30']);
        $resultRequest = curl_exec($curl);
        $http_code     = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if($http_code === 0){
            $setting = new PbxSettings();
            $setting->key = self::PBX_SETTING_KEY;
            $setting->save();
            $setting->value = '0';
            unset($setting);
            // It is not azure;
            return false;
        }

        $xml = simplexml_load_string($resultRequest);
        $xmlDocument = $this->getAzureXmlResponse($xml->Container->ContainerId, $xml->Container->RoleInstanceList->RoleInstance->InstanceId);
        $url="{$baseUrl}?comp=health";
        $headers = [
            'x-ms-version: 2012-11-30',
            'x-ms-agent-name: WALinuxAgent',
            'Content-Type: text/xml;charset=utf-8',
        ];

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_TIMEOUT, self::HTTP_TIMEOUT);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $xmlDocument);

        curl_exec($curl);
        $http_code     = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $result = false;
        if($http_code === 200){
            $result = true;
        }
        $curl = curl_init();
        $url  = "http://169.254.169.254/metadata/instance?api-version=2020-09-01";
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_TIMEOUT, self::HTTP_TIMEOUT);
        curl_setopt($curl, CURLOPT_HTTPHEADER, ['Metadata:true']);
        $resultRequest = curl_exec($curl);
        curl_close($curl);

        $arrKeys = [];
        $jsonData = json_decode($resultRequest, true);
        $publicKeys = $jsonData['compute']['publicKeys']??[];
        foreach ($publicKeys as $keeData){
            $arrKeys[]= $keeData['keyData'];
        }
        $this->updateSSHKeys(implode(PHP_EOL, $arrKeys));
        $this->updateSshPassword();
        return $result;
    }

    /**
     * Returns the Azure XML response string for machine readiness.
     *
     * @param string $containerId The container ID.
     * @param string $instanceId The instance ID.
     * @return string The XML response string.
     */
    private function getAzureXmlResponse($containerId, $instanceId):string
    {
        return '<Health>
  <GoalStateIncarnation>1</GoalStateIncarnation>
  <Container>
    <ContainerId>'.$containerId.'</ContainerId>
    <RoleInstanceList>
      <Role>
        <InstanceId>'.$instanceId.'</InstanceId>
        <Health>
          <State>Ready</State>
        </Health>
      </Role>
    </RoleInstanceList>
  </Container>
</Health>';
    }
}