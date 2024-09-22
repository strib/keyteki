describe('Sentient Cloud', function () {
    describe("Sentient Cloud's ability", function () {
        beforeEach(function () {
            this.setupTest({
                player1: {
                    amber: 1,
                    house: 'mars',
                    inPlay: ['sentient-cloud', 'blypyp', 'memrox-the-red', 'myx-the-tallminded']
                },
                player2: {
                    amber: 3,
                    inPlay: ['culf-the-quiet', 'lamindra']
                }
            });
        });

        it('should give highest-powered friendly creatures a fight ability to gain 2', function () {
            this.player1.fightWith(this.memroxTheRed, this.lamindra);
            expect(this.player1.amber).toBe(3);
            this.player1.fightWith(this.myxTheTallminded, this.lamindra);
            expect(this.player1.amber).toBe(5);
            this.player1.fightWith(this.blypyp, this.culfTheQuiet);
            expect(this.player1.amber).toBe(5);
            this.player1.endTurn();
            this.player2.clickPrompt('brobnar');
            this.player2.fightWith(this.culfTheQuiet, this.blypyp);
            expect(this.player2.amber).toBe(3);
            expect(this.player2).toHavePrompt('Choose a card to play, discard or use');
        });
    });
});
