// example.test.ts
import { describe, expect, test, vi, beforeEach, afterEach } from "vite-plus/test";

// 假设这是我们要测试的一个简单函数
function sum(a: number, b: number): number {
    return a + b;
}

// 使用 describe 对相关的测试进行分组
describe("sum function", () => {
    // 使用 test 或 it 来定义具体的测试用例
    test("adds 1 + 2 to equal 3", () => {
        expect(sum(1, 2)).toBe(3);
    });

    test("adds 0 + 0 to equal 0", () => {
        expect(sum(0, 0)).toBe(0);
    });
});

// 演示如何测试异步函数和 mock
describe("async function with mock", () => {
    // 假设我们有一个异步函数
    // async function fetchData(shouldSucceed: boolean): Promise<string> {
    //     if (shouldSucceed) {
    //         return "success data";
    //     } else {
    //         throw new Error("Failed to fetch");
    //     }
    // }

    // 使用 vi.fn() 创建一个 mock 函数
    const mockFetch = vi.fn();

    beforeEach(() => {
        // 在每个测试前重置 mock 的状态
        mockFetch.mockReset();
    });

    afterEach(() => {
        // 在每个测试后清理
        vi.clearAllMocks();
    });

    test("fetchData should resolve with data on success", async () => {
        // 配置 mock 函数的返回值
        mockFetch.mockResolvedValue("success data");

        const result = await mockFetch(true);
        expect(result).toBe("success data");
        expect(mockFetch).toHaveBeenCalledWith(true);
    });

    test("fetchData should throw error on failure", async () => {
        // 配置 mock 函数抛出错误
        mockFetch.mockRejectedValue(new Error("Failed to fetch"));

        await expect(mockFetch(false)).rejects.toThrow("Failed to fetch");
    });
});
