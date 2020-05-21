SearchComicsWithFeaturingTwoCharacters = {
    ext_lang: 'search_comics_with_featurnig_two_characters_code',
    formats: ['format_search_comics_with_featurnig_two_characters_json'],
    struct_support: true,

    factory: function (sandbox) {
        return new setSearchComicsWithFeaturingTwoCharactersViewerWindow(sandbox);
    }
};

var setSearchComicsWithFeaturingTwoCharactersViewerWindow = function (sandbox) {
    var self = this;
    this.sandbox = sandbox;
    this.sandbox.container = sandbox.container;
    var inputFirst = '#series-tools-' + sandbox.container + " #series_first-input"
    var inputSecond = '#series-tools-' + sandbox.container + " #series_second-input"
    var buttonFind = '#series-tools-' + sandbox.container + " #button-find-series";
    var keynodes = ['ui_search_comics_with_featurnig_two_characters_in_memory'];
    $('#' + sandbox.container).prepend('<div class="inputBox" id="series-tools-' + sandbox.container + '"></div>');
    $('#series-tools-' + sandbox.container).load('static/components/html/search_comics_with_featurnig_two_characters_component.html', function () {
        SCWeb.core.Server.resolveScAddr(keynodes, function (keynodes) {
            SCWeb.core.Server.resolveIdentifiers(keynodes, function (idf) {
                var buttonSearch = idf[keynodes['ui_search_comics_with_featurnig_two_characters_in_memory']];
                $(buttonFind).html(buttonSearch);
                $(buttonFind).click(function () {
                    var firstString = $(inputFirst).val();
                    var secondString = $(inputSecond).val();
                    if (firstString && secondString) {
                        var searchParams = {
                            first: firstString.toString(),
                            second: secondString.toString()
                        };
                        findComicsWithFeaturingTwoCharacters(searchParams);
                    }
                });
            });
        });
    });
    this.applyTranslation = function (namesMap) {
        SCWeb.core.Server.resolveScAddr(keynodes, function (keynodes) {
            SCWeb.core.Server.resolveIdentifiers(keynodes, function (idf) {
                var buttonLoad = idf[keynodes['ui_search_comics_with_featurnig_two_characters_in_memory']];
                $(buttonFind).html(buttonLoad);
            });
        });
    };
    this.sandbox.eventApplyTranslation = $.proxy(this.applyTranslation, this);
};

SCWeb.core.ComponentManager.appendComponentInitialize(SearchComicsWithFeaturingTwoCharacters);

function findComicsWithFeaturingTwoCharacters(searchParams) {
    SCWeb.core.Server.resolveScAddr([searchParams.first, searchParams.second], function (keynodes) {
        addr1 = keynodes[searchParams.first];
        addr2 = keynodes[searchParams.second];
        if (!addr1 && !addr2){
            return;
        }
        SCWeb.core.Server.resolveScAddr(["ui_menu_file_for_finding_comics_with_featurnig_two_characters"], function (data) {
            var cmd = data["ui_menu_file_for_finding_comics_with_featurnig_two_characters"];
            SCWeb.core.Main.doCommand(cmd, [addr1, addr2], function (result) {
                if (result.question != undefined) {
                    SCWeb.ui.WindowManager.appendHistoryItem(result.question);
                }
            });
        });
    });
}
