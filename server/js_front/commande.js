$(() => {
    //to delete all tracking cookie if needed
    initPage()

    function initPage() {
        // $.removeCookie('command_tokens')
        updateTrackLinks()
    }

    function getInputData() {
        let data = {};
        $('select, input, textarea').each(function (i, val) {
            data[val.id] = val.value;
        })
        return data;
    }

    function updateTrackLinks() {
        $('#tracking_links').children().remove()
        $('#tracking_informations').children().remove()
        $('header').children('#track_links_title').remove()
        if (typeof ($.cookie('command_tokens')) === 'undefined') return;

        $('header').prepend(
            $('<h1></h1>')
                .text('Suivi de commandes :')
                .attr('id', 'track_links_title')
        )

        JSON.parse($.cookie('command_tokens')).tokens.forEach(v => {
            // console.log(v)
            $('#tracking_links').append(
                $('<a></a>')
                    .attr('class', 'tracking_link')
                    .text(v.sos_type)
                    // .attr('href', '/pages/suivi/' + v.id)
                    .click(function () {
                        // update each other link's state
                        if (typeof (this.already_shown) === 'undefined') this.already_shown = false
                        $(this).siblings().each(function () {
                            this.already_shown = false;
                        })
                        // if the details aren't shown, show them
                        if (!this.already_shown) {
                            $.get({
                                url: '/pages/suivi/' + v.id,
                                success: d => {
                                    // console.log(d.replace(/(\r\n\t|\n|\r\t)/gm, "").match(/<body>.*<\/body>/)[0])
                                    // remove spaces then capture the body tag
                                    $('#tracking_informations').html(d.replace(/(\r\n\t|\n|\r\t)/gm, "").match(/<body>.*<\/body>/)[0])
                                    this.already_shown = true
                                },
                                error: err => {
                                    $('#tracking_informations').append(
                                        $('<div></div>')
                                            .append(
                                                $('<p></p>')
                                                    .text("Commande non trouvée, peut-être qu'elle n'existe plus")
                                            )
                                            .append(
                                                $('<input>')
                                                    .attr('type', 'button')
                                                    .val('Supprimer')
                                                    .click(() => {
                                                        // remove the cookie
                                                        command_tokens = JSON.parse($.cookie('command_tokens'));
                                                        for (let i = 0; i < command_tokens.tokens.length; i++) {
                                                            if (command_tokens.tokens[i].id === v.id) {
                                                                command_tokens.tokens.splice(i, 1)
                                                            }
                                                        }
                                                        command_tokens = JSON.stringify(command_tokens);
                                                        $.cookie('command_tokens', command_tokens);

                                                        // update shown links
                                                        updateTrackLinks()
                                                    })
                                            )
                                    )
                                }
                            })
                            this.already_shown = true
                            // if the details are already shown, hide them
                        } else {
                            $('#tracking_informations').children().remove();
                            this.already_shown = false;
                        }
                    })
            )
        });
    }

    $('#submit').click(() => {
        const data = getInputData();
        // console.log(data);
        $.get({
            url: '/submit_command',
            data,
            success: function (d) {
                // alert(`l'id de ta commande est : ${d.id}`)
                let command_tokens = $.cookie('command_tokens');
                // console.log(typeof(command_tokens) === 'undefined')
                // console.log(JSON.stringify(JSON.parse(command_tokens).tokens.push(d.id)))
                if (typeof (command_tokens) === 'undefined') {
                    $.cookie('command_tokens', JSON.stringify({ tokens: [{ id: d.id, sos_type: data.sos_choice }] }))
                }
                else {
                    command_tokens = JSON.parse(command_tokens);
                    command_tokens.tokens.push({ id: d.id, sos_type: data.sos_choice });
                    command_tokens = JSON.stringify(command_tokens);
                    $.cookie('command_tokens', command_tokens);
                }
                updateTrackLinks()
            }
        })
    })
})