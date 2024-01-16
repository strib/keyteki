const Card = require('../../Card.js');

class PlowSword extends Card {
    // Action: Put a creature in a discard pile on the bottom of its
    // owner’s deck. If you do, deal 3 to a creature.
    setupCardAbilities(ability) {
        this.action({
            target: {
                cardType: 'creature',
                location: 'discard',
                gameAction: ability.actions.returnToDeck({
                    bottom: true
                })
            },
            then: {
                target: {
                    cardType: 'creature',
                    gameAction: ability.actions.dealDamage({
                        amount: 3
                    })
                }
            }
        });
    }
}

PlowSword.id = 'plow-sword';

module.exports = PlowSword;
