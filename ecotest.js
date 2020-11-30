//module.exports = {
  //'Demo test ecosia.org' : function(browser) {
    //browser
      //.url('https://www.ecosia.org/')
      //.waitForElementVisible('body')
      //.assert.titleContains('Ecosia')
      //.assert.visible('input[type=search]')
      //.setValue('input[type=search]', 'nightwatch')
      //.assert.visible('button[type=submit]')
      //.click('button[type=submit]')
      //.assert.containsText('.mainline-results', 'Nightwatch.js')
      //.end();
  //}
//};

let clearInputs = async function(browser){
	for ( let bowl of ['left', 'right']) {
		for ( let num = 0; num < 9; num++ ) {
			await browser.clearValue(`#${bowl}_${num}`)
		}
	}

}

let findSmallerBowl = async function(barNumbers, browser){
	console.log('find the smallest among: ', barNumbers)
	let bowls = { left:[], right:[] }
	let smallerBowl = null
	// split the bars between the bowls. one will be left over
	while ( barNumbers.length >= 2 ) {
		bowls.left.push(barNumbers.pop())
		bowls.right.push(barNumbers.pop())
	}
	for ( let bowl in bowls ) {
		for ( let num = 0; num < bowls[bowl].length; num++ ) {
			console.log('36', `#${bowl}_${num}`, bowls[bowl][num].toString())
			await browser.setValue(`#${bowl}_${num}`, bowls[bowl][num].toString())
		}
	}
	await browser.pause(1000)
	await browser.click('#weigh')
	await browser.pause(1000)
	let weighingsString = (await browser.getText('.game-info ol'))
	console.log('wei?', weighingsString)
	let weighings = weighingsString.value.split('\n')
	let lastWeighing = weighings[weighings.length - 1]
	//console.log('wei?', lastWeighing)
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
	console.log('smaller bowl? ', smallerBowl, bowls)
	await clearInputs(browser)
	await browser.pause(1000)
	return findSmallerBowl(smallerBowl, browser)
}

module.exports.findFakeGold = async function(browser){
	let barNumbers = [0,1,2,3,4,5,6,7,8]

	await browser.url('http://ec2-54-208-152-154.compute-1.amazonaws.com/')
	await browser.waitForElementVisible('#root')
	let fakeBarNumber = await findSmallerBowl(barNumbers, browser)
	console.log('???', fakeBarNumber)
	await browser.click(`#coin_${fakeBarNumber}`)
	await browser.end();
}




