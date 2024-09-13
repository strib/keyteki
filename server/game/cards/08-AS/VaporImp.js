const Card = require('../../Card.js');

class VaporImp extends Card {
    // After Reap: Discard a random card from your hand. During your
    // opponent’s next turn, they cannot play cards of the discarded
    // card’s type.
    setupCardAbilities(ability) {
        this.reap({
            gameAction: ability.actions.discardAtRandom((context) => ({
                target: context.player
            })),
            then: {
                condition: (context) =>
                    context.player.opponent && context.preThenEvent.cards.length > 0,
                gameAction: ability.actions.nextRoundEffect((context) => ({
                    targetController: 'opponent',
                    effect: ability.effects.playerCannot(
                        'play',
                        (innerContext) =>
                            innerContext.source.type === context.preThenEvent.cards[0].type
                    )
                }))
            }
        });
    }
}

VaporImp.id = 'vapor-imp';

module.exports = VaporImp;
