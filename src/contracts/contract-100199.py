#!/bin/env python3

#####
# Algorithmic Stock Trader I
# You are attempting to solve a Coding Contract. You have 4 tries remaining, after which the contract will self-destruct.
# You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:
# 83,134,50,80,41,181,173,31,100,191,11,171,186,161,75,70,8,154,185,8,59,66,77,175,150,6,53,182,144,118,14,118,41,135,47,9,148,74,77
# Determine the maximum possible profit you can earn using at most one transaction (i.e. you can only buy and sell the stock once). If no profit can be made then the answer should be 0. Note that you have to buy the stock before you can sell it
#####

stocks = [
        83,134,50,80,41,181,173,31,100,191,11,171,186,161,75,70,8,154,185,8,59,66,77,175,150,6,53,182,144,118,14,118,41,135,47,9,148,74,77
]

best_profit = 0

for pb in range(0, len(stocks)):
    buying = stocks[pb]
    for ps in range(pb+1, len(stocks)):
        profit = stocks[ps] - buying
        if profit > best_profit:
            print(f"new best profit at {pb}({stocks[pb]}) -> {ps}({stocks[ps]}) to {profit}")
            best_profit = profit

print(f"Best profit: {best_profit}")
    


