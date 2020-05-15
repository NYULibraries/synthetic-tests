const syntheticTest = require('../lib/syntheticTest');

describe('adapt', () => {
  it('identify and return http', () => {
    expect(syntheticTest.adapt('http://www.example.com/')).toEqual(require("http"))
  })
})

describe('httpResponse', () => {
  describe('without a response url', () => {
        it('should throw an error', () => {
            expect.assertions(1);
						return syntheticTest
							.httpResponse()
							.catch((e) => expect(e.message).toMatch('Received undefined'));
				});
  })
    describe('with a string that is not a url', () => {
        it('should throw an error', () => {
					expect.assertions(1);
					return syntheticTest
						.httpResponse('watermelon')
						.catch((e) => expect(e).toMatch('Error'));
				});
  });
})

describe('testHttpResponse', () => {
 describe('without a response url', () => {
    it('should throw an error', () => {
			expect.assertions(1);
			return syntheticTest
				.httpResponse()
				.catch((e) => expect(e.message).toMatch('Received undefined'));
		});
  });

  describe('for a successful response url', () => {
    it('should return true for a matching success status code', async () => {
     const test = await syntheticTest.testHttpResponse({
				url: 'http:/www.example.com/',
				status: 200,
				responseTime: 500,
			});
      expect(test).toBe(true);
    });

    it('should return false for response not received in specified time', async () => {
      const test = await syntheticTest.testHttpResponse({ 
        url: 'http://www.example.com/', 
        status: 200, 
        responseTime: 1 
        });
        expect(test).toBe(false);
    });

    it('should return false for a wrong status code', async () => {
			const test = await	syntheticTest.testHttpResponse({
					url: 'http://www.example.com/',
					status: 201,
					responseTime: 500,
				});
			expect(test).toBe(false);
    });
  });

  describe('for a not found url', () => {
    it('should return true for a matching error status code', async () => {
      const test = await syntheticTest.testHttpResponse({ 
          url: 'http://www.example.com/not/existing/path', 
          status: 404, 
          responseTime: 500 
          });
      expect(test).toBe(true);
    });

    it('should return false for response not received in specified time', async () => {
      const test = await syntheticTest.testHttpResponse({
					url: 'http://www.example.com/not/existing/path',
					status: 404,
					responseTime: 1,
				});
		  expect(test).toBe(false);
    });

    it('should return false for a wrong status code', async () => {
			const test = await syntheticTest.testHttpResponse({
					url: 'http://www.example.com/not/existing/path',
					status: 500,
					responseTime: 500,
				});
			expect(test).toBe(false);
    });
  });

  describe('for a redirecting url', () => {
    it('should return true for the correct status code', async () => {
      const test = await syntheticTest.testHttpResponse({ 
        url: 'http://www.google.com/', 
        status: 301, 
        responseTime: 500 
        });
      expect(test).toBe(true);
    });

    it('should return false for response not received in specified time', async () => {
      const test = await 	syntheticTest.testHttpResponse({
					url: 'http://www.google.com',
					status: 301,
					responseTime: 1,
				});
			expect(test).toBe(false);
    });


    it('should return false for an incorrect status code', async () => {
      const test = await syntheticTest.testHttpResponse({
					url: 'http://www.google.com/',
					status: 302,
					responseTime: 500,
				});
			expect(test).toBe(false);
    });

    it('should return true for the correct status code and redirect location', async () => {
      const test = await syntheticTest.testHttpResponse({
        url: 'http://www.google.com/',
        status: 301,
        responseTime: 500,
        redirectLocation: 'https://www.google.com',
      });
      expect(test).toBe(true);
    });

    it('should return false with correct redirect location for response not received in specified time', async () => {
      const test = await syntheticTest.testHttpResponse({
					url: 'http://www.google.com/',
					status: 301,
					responseTime: 1,
					redirectLocation: 'https://www.google.com',
				});
			expect(test).toBe(false);
    });

    it('should return false for the correct status code and incorrect redirect location', async () => {
      const test = await syntheticTest.testHttpResponse({
					url: 'http://www.google.com',
					status: 302,
					responseTime: 500,
					redirectLocation: 'https://www.google.com',
				});
			expect(test).toBe(false);
    });
  });
});

//syntheticTest.testHttpResponse =  jest.fn();

describe('checkUrl', () => {
  it('should call sendMessage when testHttpResponse returns false', ()=>{
    expect(syntheticTest.checkUrl({ url: 'https://www.google.com', status: 201, responseTime: 1 })).toBe(false);
    expect(syntheticTest.testHttpResponse).toHaveBeenCalledTimes(1);
  });

  it('should not call sendMessage when testHttpResponse returns true', ()=> {
    expect(syntheticTest.checkUrl({ url: 'https://www.example.com', status: 200, responseTime: 500 })).toBe(true);
    expect(syntheticTest.testHttpResponse).toHaveBeenCalledTimes(0);
  });
});
