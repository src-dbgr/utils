# Simple script to search for keywords on websites

## Accepts certain params to adjust the behaviour

## Install `chalk` and `node-fetch` to make it work

```
npm install chalk
npm install node-fetch
```

### Available Params

```
--search=alpha,beta,gamma                            Pass search arguments as csv ***REQUIRED***

--urls=https://www.google.com,https://www.online.com Pass search arguments as csv *optional* default one address`

--pages=5                                            Pass search arguments as single value *optional* default value is 1

--offsetneg=20                                       Pass search arguments as single value *optional* default value is 20

--offsetpos=100
Pass search arguments as single value *optional* default value is 100

--timeout=1500                                       Pass search arguments as single value *optional* default value is 1500

--startpage=0                                        Pass search arguments as single value *optional* default value is 0
```

## Exectue

` node fetch.js --search=<keyword1,keyword2,...> <further optional arguments>`
`

## Get Help

`node fetch.js --help`
