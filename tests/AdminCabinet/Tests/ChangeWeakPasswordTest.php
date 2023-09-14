<?php
/*
 * MikoPBX - free phone system for small business
 * Copyright © 2017-2023 Alexey Portnov and Nikolay Beketov
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

namespace MikoPBX\Tests\AdminCabinet\Tests;

use Facebook\WebDriver\WebDriverBy;
use Facebook\WebDriver\WebDriverExpectedCondition;
use MikoPBX\Tests\AdminCabinet\Lib\MikoPBXTestsBase;

class ChangeWeakPasswordTest extends MikoPBXTestsBase
{
    /**
     * Test changing a weak password and verifying the changes.
     *
     * @depends testLogin
     * @dataProvider passwordChangeProvider
     *
     * @param array $params The parameters for password change.
     *
     * @throws \Facebook\WebDriver\Exception\NoSuchElementException
     * @throws \Facebook\WebDriver\Exception\TimeoutException
     */
    public function testChangeWeakPassword(array $params): void
    {
        // Wait until the password validation message is located on the page
        $xpath = '//div[contains(@class, "password-validate")]';
        self::$driver->wait()->until(
            WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::xpath($xpath))
        );

        // Change SSH password
        self::$driver->get("{$GLOBALS['SERVER_PBX']}/admin-cabinet/general-settings/modify/#/ssh");
        $this->changeInputField('SSHPassword', $params['password']);
        $this->changeInputField('SSHPasswordRepeat', $params['password']);

        // Change WebAdmin password
        self::$driver->get("{$GLOBALS['SERVER_PBX']}/admin-cabinet/general-settings/modify/#/passwords");
        $this->changeInputField('WebAdminPassword', $params['password']);
        $this->changeInputField('WebAdminPasswordRepeat', $params['password']);

        // Submit the form
        $this->submitForm('general-settings-form');

        // Click on the sidebar menu item to refresh the page
        $this->clickSidebarMenuItemByHref("/admin-cabinet/general-settings/modify/");

        // Verify SSH password change
        self::$driver->get("{$GLOBALS['SERVER_PBX']}/admin-cabinet/general-settings/modify/#/ssh");
        $this->assertInputFieldValueEqual('SSHPassword', $params['checkPassword'], true);
        $this->assertInputFieldValueEqual('SSHPasswordRepeat', $params['checkPassword'], true);

        // Verify WebAdmin password change
        self::$driver->get("{$GLOBALS['SERVER_PBX']}/admin-cabinet/general-settings/modify/#/passwords");
        $this->assertInputFieldValueEqual('WebAdminPassword', $params['checkPassword'], true);
        $this->assertInputFieldValueEqual('WebAdminPasswordRepeat', $params['checkPassword'], true);
    }

    /**
     * Dataset provider for password change test.
     *
     * @return array
     */
    public function passwordChangeProvider(): array
    {
        $params = [];

        $params[] = [
            [
                'password'       => '123456789MikoPBX#1',
                'checkPassword'  => 'xxxxxxx',
            ],
        ];

        return $params;
    }
}





