describe('Plan 10', function () {
    describe("Plan 10's ability", function () {
        beforeEach(function () {
            this.setupTest({
                player1: {
                    amber: 1,
                    house: 'mars',
                    hand: ['plan-10', 'hypnobeam'],
                    inPlay: ['echofly', 'john-smyth']
                },
                player2: {
                    amber: 1,
                    token: 'priest',
                    inPlay: ['priest:ritual-of-balance', 'thing-from-the-deep', 'ironyx-rebel']
                }
            });
            this.ritualOfBalance = this.priest;
        });

        it('puts each non-Mars creature under it on play', function () {
            this.player1.play(this.plan10);
            expect(this.echofly.location).toBe('under');
            expect(this.game.isCardVisible(this.echofly, this.player1.player)).toBe(true);
            expect(this.game.isCardVisible(this.echofly, this.player2.player)).toBe(true);
            expect(this.ritualOfBalance.location).toBe('under');
            expect(this.thingFromTheDeep.location).toBe('under');
            expect(this.johnSmyth.location).toBe('play area');
            expect(this.ironyxRebel.location).toBe('play area');
            expect(this.plan10.childCards.length).toBe(3);
            expect(this.player1).toHavePrompt('Choose a card to play, discard or use');
        });

        it('allows the active player to return a card at the end of each turn', function () {
            this.player1.play(this.plan10);
            this.player1.endTurn();
            expect(this.player1).toBeAbleToSelect(this.echofly);
            expect(this.player1).toBeAbleToSelect(this.ritualOfBalance);
            expect(this.player1).toBeAbleToSelect(this.thingFromTheDeep);
            expect(this.player1).not.toBeAbleToSelect(this.johnSmyth);
            expect(this.player1).not.toBeAbleToSelect(this.ironyxRebel);
            this.player1.clickCard(this.echofly);
            expect(this.echofly.location).toBe('hand');
            expect(this.player1.player.hand).toContain(this.echofly);

            this.player2.clickPrompt('untamed');
            this.player2.endTurn();
            expect(this.player2).not.toBeAbleToSelect(this.echofly);
            expect(this.player2).toBeAbleToSelect(this.ritualOfBalance);
            expect(this.player2).toBeAbleToSelect(this.thingFromTheDeep);
            expect(this.player2).not.toBeAbleToSelect(this.johnSmyth);
            expect(this.player2).not.toBeAbleToSelect(this.ironyxRebel);
            this.player2.clickCard(this.ritualOfBalance);
            expect(this.ritualOfBalance.location).toBe('hand');
            expect(this.player2.player.hand).toContain(this.ritualOfBalance);

            this.player1.clickPrompt('mars');
            this.player1.endTurn();
            expect(this.player1).not.toBeAbleToSelect(this.echofly);
            expect(this.player1).not.toBeAbleToSelect(this.ritualOfBalance);
            expect(this.player1).toBeAbleToSelect(this.thingFromTheDeep);
            expect(this.player1).not.toBeAbleToSelect(this.johnSmyth);
            expect(this.player1).not.toBeAbleToSelect(this.ironyxRebel);
            this.player1.clickCard(this.thingFromTheDeep);
            expect(this.thingFromTheDeep.location).toBe('hand');
            expect(this.player2.player.hand).toContain(this.thingFromTheDeep);

            expect(this.plan10.location).toBe('discard');
        });

        it('works correctly for non-owned creatures', function () {
            this.player1.play(this.hypnobeam);
            this.player1.clickCard(this.thingFromTheDeep);
            this.player1.clickPrompt('Right');
            this.player1.play(this.plan10);
            expect(this.thingFromTheDeep.location).toBe('under');
            expect(this.player1.player.creaturesInPlay).not.toContain(this.thingFromTheDeep);
            expect(this.player2.player.creaturesInPlay).not.toContain(this.thingFromTheDeep);
            this.player1.endTurn();
            this.player1.clickCard(this.thingFromTheDeep);
            expect(this.plan10.childCards).not.toContain(this.thingFromTheDeep);
            expect(this.thingFromTheDeep.location).toBe('hand');
            expect(this.player2.player.hand).toContain(this.thingFromTheDeep);
        });
    });
});
