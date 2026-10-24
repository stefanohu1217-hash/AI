const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
test('SDL workbench: task, persistence, evidence, risk, gates, export and mobile',async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3000');await page.evaluate(()=>localStorage.clear());await page.reload();
 assert.equal(await page.locator('h1').textContent(),'总览看板');
 await page.locator('nav [data-page="policies"]').click();assert.equal(await page.locator('.policy-card').count(),12);
 await page.locator('[data-search]').fill('安全需求与威胁建模');assert.equal(await page.locator('.policy-card').count(),1);
 await page.locator('.policy-card').click();await page.locator('[data-policy-task]').click();
 await page.locator('[name="title"]').fill('测试：远维安全需求审查');await page.locator('[name="owner"]').fill('测试负责人');await page.locator('[name="due"]').fill('2027-01-10');await page.locator('button[type="submit"]').click();
 await page.locator('nav [data-page="tasks"]').click();await page.locator('[data-search]').fill('测试：');assert.equal(await page.locator('tbody tr').count(),1);
 await page.locator('[data-toggle]').click();assert.equal(await page.locator('tbody .badge').textContent(),'已完成');await page.reload();await page.locator('[data-search]').fill('测试：');assert.equal(await page.locator('tbody .badge').textContent(),'已完成');
 await page.locator('nav [data-page="evidence"]').click();await page.locator('[data-new-evidence]').click();await page.locator('[name="name"]').fill('安全需求评审记录');await page.locator('[name="owner"]').fill('测试负责人');await page.locator('[name="reference"]').fill('DMS/SDL/review-001');await page.locator('button[type="submit"]').click();assert.equal(await page.locator('tbody tr').count(),3);
 await page.locator('nav [data-page="risks"]').click();await page.locator('[data-risk="R-001"]').click();await page.locator('[name="status"]').selectOption('已接受');await page.locator('button[type="submit"]').click();assert.equal(await page.locator('dialog').isVisible(),true);await page.locator('[name="approval"]').fill('负责人审核；隔离网段及会话审计；到期复审');await page.locator('button[type="submit"]').click();assert.equal(await page.locator('tbody tr').first().locator('.badge').last().textContent(),'已接受');
 await page.locator('nav [data-page="gates"]').click();await page.locator('[data-gate="3"]').click();await page.locator('[name="reviewer"]').fill('测试负责人');await page.locator('[name="note"]').fill('核查 E-001');await page.locator('[name="status"]').selectOption('已通过');await page.locator('button[type="submit"]').click();assert.equal(await page.locator('dialog').isVisible(),true);await page.locator('[data-close]').first().click();
 await page.locator('[data-gate="2"]').click();await page.locator('[name="reviewer"]').fill('测试负责人');await page.locator('[name="note"]').fill('设计证据已核查');await page.locator('[name="status"]').selectOption('已通过');await page.locator('button[type="submit"]').click();assert.equal(await page.locator('.gate-card').nth(2).locator('.badge').textContent(),'已通过');
 await page.locator('nav [data-page="overview"]').click();const dl=page.waitForEvent('download');await page.locator('[data-export]').click();const download=await dl;assert.ok(download.suggestedFilename().endsWith('.json'));
 await page.screenshot({path:'/tmp/windsec-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/windsec-mobile.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 assert.deepEqual(errors,[]);
 }finally{await browser.close()}
});
