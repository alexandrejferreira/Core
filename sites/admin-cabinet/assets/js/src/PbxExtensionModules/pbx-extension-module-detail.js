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

/* global globalRootUrl, PbxApi, globalTranslate */

/**
 * Represents the extension module popup.
 * @class extensionModuleDetail
 * @memberof module:PbxExtensionModules
 */
const extensionModuleDetail = {
    /**
     * jQuery object for the module detail form.
     * @type {jQuery}
     */
    $moduleDetailPopupTpl: $('#module-details-template'),

    /**
     * jQuery object for the module detail form.
     * @type {jQuery}
     */
    $moduleDetailPopup: undefined,


    /**
     * Initialize extensionModuleDetail
     */
    initialize() {
        // The table rows which activate a detail popup.
        $(document).on('click', 'tr.new-module-row', (event)=>{
            event.preventDefault();
            const params = {};
            const $target = $(event.target);
            if ($target.closest('td').hasClass('show-details-on-click')){
                params.uniqid = $target.closest('tr').data('id');
                if (params.uniqid!==undefined){

                    // Module detail popup form
                    extensionModuleDetail.$moduleDetailPopup = extensionModuleDetail.$moduleDetailPopupTpl.clone(true);
                    extensionModuleDetail.$moduleDetailPopup.attr('id', 'modal-'+params.uniqid);

                    // Show the popup
                    extensionModuleDetail.$moduleDetailPopup
                        .modal({
                            position: 'center',
                            closable: true,
                        })
                        .modal('show');
                    PbxApi.ModulesGetModuleInfo(params, extensionModuleDetail.cbAfterGetModuleDetails);
                }
            }
        });
    },
    initializeSlider(modalForm){
        modalForm.find('.slides .right')
            .on('click', ()=> {
                modalForm.find('.slide')
                    .siblings('.active:not(:last-of-type)')
                    .removeClass('active')
                    .next()
                    .addClass('active');
            });

        modalForm.find('.slides .left')
            .on('click', ()=> {
                modalForm.find('.slide')
                    .siblings('.active:not(:first-of-type)')
                    .removeClass('active')
                    .prev()
                    .addClass('active');
            });
    },
    cbAfterGetModuleDetails(result, response) {
        if(result) {
            const repoData = response.data;

            const $newPopup = extensionModuleDetail.$moduleDetailPopup;

            // Module name
            if (repoData.name !== undefined) {
                $newPopup.find('.module-name').text(repoData.name);
            }

            // Module logo
            if (repoData.logotype && repoData.logotype!=='') {
                $newPopup.find('.module-logo').attr('src', repoData.logotype);
            } else {
                $newPopup.find('.module-logo').replaceWith('<i class="icon puzzle"></i>');
            }

            // Module uniqid
            if (repoData.uniqid !== undefined) {
                $newPopup.find('.module-id').text(repoData.uniqid);

                // Install last release button
                $newPopup.find('.main-install-button').data('uniqid', repoData.uniqid);
            }

            // Total count of installations
            if (repoData.downloads !== undefined) {
                $newPopup.find('.module-count-installed').html(repoData.downloads);
            }

            // Last release version
            if (repoData.releases[0].version !== undefined) {
                $newPopup.find('.module-latest-release').text(repoData.releases[0].version);
                const currentVersion = $(`tr.module-row[data-id=${repoData.uniqid}]`).data('version');
                if (currentVersion!==undefined){
                    $('a.main-install-button span.button-text').text(globalTranslate.ext_UpdateModuleShort);
                }
            }

            // Developer
            const developerView = extensionModuleDetail.prepareDeveloperView(repoData);
            $newPopup.find('.module-publisher').html(developerView);

            // Commercial
            if (repoData.commercial !== undefined) {
                const commercialView = extensionModuleDetail.prepareCommercialView(repoData.commercial);
                $newPopup.find('.module-commercial').html(commercialView);
            }

            // Release size
            if (repoData.releases[0].size !== undefined) {
                const sizeText = extensionModuleDetail.convertBytesToReadableFormat(repoData.releases[0].size);
                $newPopup.find('.module-latest-release-size').text(sizeText);
            }

            // Screenshots
            if (repoData.screenshots !== undefined && repoData.screenshots.length>0) {
                const screenshotsView = extensionModuleDetail.prepareScreenshotsView(repoData.screenshots);
                $newPopup.find('.module-screenshots').html(screenshotsView);
            } else {
                $newPopup.find('.module-screenshots').remove();
            }

            // Description
            const descriptionView = extensionModuleDetail.prepareDescriptionView(repoData);
            $newPopup.find('.module-description').html(descriptionView);

            // Changelog
            const changelogView = extensionModuleDetail.prepareChangeLogView(repoData);
            $newPopup.find('.module-changelog').html(changelogView);

            // Initialize images slider
            extensionModuleDetail.initializeSlider($newPopup);

            // Total count of installations
            if (repoData.eula) {
                $newPopup.find('.module-eula').html(UserMessage.convertToText(repoData.eula));
            } else {
                $newPopup.find('a[data-tab="eula"]').hide();
            }

            // Initialize tab menu
            $newPopup.find('.module-details-menu .item').tab();

            $newPopup.find('.dimmer').removeClass('active');
        }
    },
     convertBytesToReadableFormat(bytes) {
        const megabytes = bytes / (1024*1024);
        const roundedMegabytes = megabytes.toFixed(2);
        return `${roundedMegabytes} Mb`;
    },
    prepareCommercialView(commercial) {
        if(commercial==='1'){
            return '<i class="ui donate icon"></i> '+globalTranslate.ext_CommercialModule;
        }
        return '<i class="puzzle piece icon"></i> '+globalTranslate.ext_FreeModule;
    },
    prepareScreenshotsView(screenshots) {
        let html =
            '            <div class="ui container slides">\n' +
            '                <i class="big left angle icon"></i>\n' +
            '                <i class="big right angle icon"></i>';
        $.each(screenshots, function (index, screenshot) {
            if (index > 0) {
                html += `<div class="slide"><img class="ui fluid image" src="${screenshot.url}" alt="${screenshot.name}"></div>`;
            } else {
                html += `<div class="slide active"><img class="ui fluid image" src="${screenshot.url}" alt="${screenshot.name}"></div>`;
            }
        });
        html += '</div>';
        return html;
    },
    prepareDescriptionView(repoData) {
        let html = `<div class="ui header">${repoData.name}</div>`;
        html += `<p>${repoData.description}</p>`;
        html += `<div class="ui header">${globalTranslate.ext_UsefulLinks}</div>`;
        html += '<ul class="ui list">';
        html += `<li class="item"><a href="${repoData.promo_link}" target="_blank">${globalTranslate.ext_ExternalDescription}</a></li>`;
        html += '</ul>';
        return html;
    },
    prepareDeveloperView(repoData) {
        let html = '';
        html += `${repoData.developer}`;
        return html;
    },
    prepareChangeLogView(repoData) {
        let html = '';
        $.each(repoData.releases, function (index, release) {
            const sizeText = extensionModuleDetail.convertBytesToReadableFormat(release.size);
            const changeLogText = UserMessage.convertToText(release.changelog);
            html+=`<div class="ui header">${globalTranslate.ext_InstallModuleReleaseTag}: ${release.version}</div>`;
            html+=`<div class=""><i class="icon grey download"></i> ${release.downloads}</div>`;
            html+=`<p>${changeLogText}</p>`;
            html+=`<a href="#" class="ui icon labeled basic blue button download"
               data-uniqid = "${repoData.uniqid}"
               data-releaseid ="${release.releaseID}">
                <i class="icon download"></i>
                ${globalTranslate.ext_InstallModuleVersion} ${release.version} (${sizeText})
            </a>`;
        });
        return html;
    }
}

// When the document is ready, initialize the external modules detail page
$(document).ready(() => {
    extensionModuleDetail.initialize();
});
