#!/usr/bin/env node

const { constructParser } = require('../lib')

const arguments = constructParser(process.argv)
console.log(Object.keys(arguments))
