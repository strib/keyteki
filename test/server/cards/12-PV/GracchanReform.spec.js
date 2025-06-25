describe('Gracchan Reform', function () {
    describe("Gracchan Reform's ability", function () {
        beforeEach(function () {
            this.setupTest({
                player1: {
                    amber: 4,
                    house: 'saurian',
                    prophecies: [
                        'overreach',
                        'heads-i-win',
                        'trust-your-feelings',
                        'wasteful-regret'
                    ],
                    hand: ['gracchan-reform', 'exile'],
                    discard: ['urchin', 'hunting-witch', 'nerve-blast']
                },
                player2: {
                    amber: 4,
                    inPlay: ['krump'],
                    discard: ['dust-pixie', 'barrister-joya']
                }
            });
        });

        it('should play the top card of opponent deck', function () {
            this.player2.moveCard(this.dustPixie, 'deck');
            this.player1.play(this.gracchanReform);
            expect(this.dustPixie.location).toBe('play area');
            expect(this.dustPixie.controller).toBe(this.player1.player);
            expect(this.player1.amber).toBe(7);
            expect(this.player1).toHavePrompt('Choose a card to play, discard or use');
        });

        it('should archive top 2 cards of opponent deck on fate', function () {
            this.player1.activateProphecy(this.overreach, this.gracchanReform);
            this.player1.endTurn();
            this.player2.clickPrompt('brobnar');
            this.player2.moveCard(this.urchin, 'deck');
            this.player2.moveCard(this.huntingWitch, 'deck');
            this.player2.moveCard(this.nerveBlast, 'deck');
            this.player2.reap(this.krump);
            expect(this.nerveBlast.location).toBe('archives');
            expect(this.huntingWitch.location).toBe('archives');
            expect(this.player1.player.archives.length).toBe(2);
            expect(this.gracchanReform.location).toBe('discard');
            expect(this.player2).toHavePrompt('Choose a card to play, discard or use');
        });

        it('should let you choose the house of a creature played that way while it is in play', function () {
            this.player2.moveCard(this.barristerJoya, 'deck');
            this.player1.play(this.gracchanReform);
            this.player1.endTurn();
            this.player2.clickPrompt('brobnar');
            this.player2.endTurn();
            this.player1.clickPrompt('sanctum');
            this.player1.fightWith(this.barristerJoya, this.krump);
            expect(this.barristerJoya.location).toBe('discard');
            expect(this.player2.player.discard).toContain(this.barristerJoya);
            this.player1.endTurn();
            this.player2.clickPrompt('brobnar');
            this.player2.endTurn();
            expect(this.player1).not.toHavePrompt('sanctum');
            expect(this.player1).not.toHavePrompt('saurian');
            this.player1.clickPrompt('saurian');
            this.player1.moveCard(this.gracchanReform, 'hand');
            this.player2.moveCard(this.dustPixie, 'deck');
            this.player1.play(this.gracchanReform);
            expect(this.dustPixie.location).toBe('play area');
            expect(this.dustPixie.controller).toBe(this.player1.player);
            this.player1.activateProphecy(this.trustYourFeelings, this.exile);
            this.player1.clickPrompt('sanctum');
            this.player1.amber = 1;
            this.player1.endTurn();
            this.player2.player.deck = [];
            this.player2.clickPrompt('sanctum');
            this.player2.endTurn();
            expect(this.player1).not.toHavePrompt('sanctum');
            expect(this.player1).not.toHavePrompt('untamed');
        });
    });
});
