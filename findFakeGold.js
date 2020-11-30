// a simple utility function to empty the inputs, so we can fill them again
let clearInputs = async function(browser){
	for ( let bowl of ['left', 'right']) {
		for ( let num = 0; num < 9; num++ ) {
			await browser.clearValue(`#${bowl}_${num}`)
		}
	}

}

// recursively find the smallest item by returning the smaller half
let findSmallerBowl = async function(barNumbers, browser){
	let bowls = { left:[], right:[] }
	let smallerBowl = null

	// split the bars between the bowls. one will be left over when this is run on all 9 bars
	while ( barNumbers.length >= 2 ) {
		bowls.left.push(barNumbers.pop())
		bowls.right.push(barNumbers.pop())
	}
	//
	// input the bar numbers as values to the inputs
	for ( let bowl in bowls ) {
		for ( let num = 0; num < bowls[bowl].length; num++ ) {
			await browser.setValue(`#${bowl}_${num}`, bowls[bowl][num].toString())
		}
	}

	await browser.click('#weigh')

	let weighingsString = (await browser.getText('.game-info ol'))
	let weighings = weighingsString.value.split('\n')
	let lastWeighing = weighings[weighings.length - 1]

	if ( lastWeighing.includes('<') ) {
		smallerBowl = bowls.left
	}
	else if ( lastWeighing.includes('>') ) {
		smallerBowl = bowls.right
	}
	else if ( barNumbers.length == 1 ) { 
		// both bowls are the same weight, so the fake bar is the one we didn't weigh
		return barNumbers[0] 
	}
	else { throw Error('No fake gold was found.') }


	if ( smallerBowl.length == 1 ) {
		// if the smaller bowl has exactly one bar in it, then it must be the fake bar
		return smallerBowl[0]
	}
	else {
		// repeat the process on the smaller bowl
		await clearInputs(browser)
		return findSmallerBowl(smallerBowl, browser)
	}
}

module.exports.findFakeGold = async function(browser){
	let barNumbers = [0,1,2,3,4,5,6,7,8]

	await browser.url('http://ec2-54-208-152-154.compute-1.amazonaws.com/')
	await browser.waitForElementVisible('#root')

	// recursively find the smallest bar, click the button, then format the output
	let fakeBarNumber = await findSmallerBowl(barNumbers, browser)
	let weighingsString = (await browser.getText('.game-info ol'))
	let weighings = weighingsString.value.split('\n')

	await browser.click(`#coin_${fakeBarNumber}`)
	let alertText = await browser.getAlertText()
	console.log(alertText.value)
	console.log(`The fake bar was bar #${fakeBarNumber}`)
	console.log('The following weighings were made: ')
	console.log(weighings)
	console.log(`The bars were weighed ${weighings.length} times.`)
	browser.assert.ok(weighings.length <= 3) // it should take at most 3 weighings to find the fake bar
	await browser.end();
}





