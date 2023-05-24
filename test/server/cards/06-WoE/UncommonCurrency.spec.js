describe('Uncommon Currency', function () {
    describe("Uncommon Currency's ability", function () {
        beforeEach(function () {
            this.setupTest({
                player1: {
                    house: 'ekwidon',
                    inPlay: ['uncommon-currency', 'gauntlet-of-command', 'antiquities-dealer']
                },
                player2: {
                    inPlay: ['pelf', 'ikwiki-outpost']
                }
            });
        });

        it('swap and use an ekwidon artifact', function () {
            this.player1.useAction(this.uncommonCurrency);
            expect(this.player1).toBeAbleToSelect(this.ikwikiOutpost);
            expect(this.player1).not.toBeAbleToSelect(this.gauntletOfCommand);
            expect(this.player1).not.toBeAbleToSelect(this.pelf);
            this.player1.clickCard(this.ikwikiOutpost);
            this.player1.useAction(this.ikwikiOutpost);
            this.player1.clickCard(this.antiquitiesDealer);
            expect(this.antiquitiesDealer.location).toBe('deck');
        });
    });
});
