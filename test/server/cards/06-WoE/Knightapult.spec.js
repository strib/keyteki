describe('Knightapult', function () {
    describe('action', function () {
        beforeEach(function () {
            this.setupTest({
                player1: {
                    house: 'sanctum',
                    amber: 3,
                    inPlay: ['chelonia', 'knightapult'],
                    hand: ['holdfast', 'berinon']
                },
                player2: {
                    inPlay: ['troll', 'gub']
                }
            });

            this.player1.useAction(this.knightapult);
        });

        describe('should cause the next creature played', function () {
            beforeEach(function () {
                this.player1.play(this.holdfast);
            });

            it('to have deploy', function () {
                expect(this.player1).toHavePrompt('Deploy Left');
                expect(this.player1).toHavePrompt('Deploy Right');
                expect(this.holdfast.hasKeyword('deploy')).toBe(true);
            });

            it('to be ready', function () {
                expect(this.holdfast.exhausted).toBe(false);
            });
        });

        it('should only apply to the first creature played');
    });
});
