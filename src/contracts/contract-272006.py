#!/bin/env python3

#####
# Algorithmic Stock Trader II
# You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
#
#
# You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:
#
# 193,40,20,79,58,16,20,131,72,19,97,182,28,180,38,105,95,139,63,37,54,104,67,117,44,160,88,171,42,152,64,39,178,45,200,3,143,45,128,133,159,192,119,90,47,41,127,132,113,6
#
# Determine the maximum possible profit you can earn using as many transactions as you'd like. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you buy it again.
#
# If no profit can be made, then the answer should be 0
#####

stocks = [
        193,40,20,79,58,16,20,131,72,19,97,182,28,180,38,105,95,139,63,37,54,104,67,117,44,160,88,171,42,152,64,39,178,45,200,3,143,45,128,133,159,192,119,90,47,41,127,132,113,6
]

pi = 0
total = 0
profit = 0
for ps in range(1, len(stocks)):
    buying = stocks[pi]
    profit = stocks[ps] - buying

    # stock drop
    if stocks[ps] < stocks[ps-1]:
        total += stocks[ps-1] - buying
        pi = ps
        profit = 0
if profit > 0:
    total += profit

print(f"max profit {total}")
    


