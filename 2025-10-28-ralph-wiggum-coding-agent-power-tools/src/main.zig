const std = @import("std");
const minibaml = @import("_2025_10_28_ralph_wiggum_coding_");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    if (args.len < 2) {
        printUsage();
        return;
    }

    const command = args[1];

    if (std.mem.eql(u8, command, "fmt")) {
        if (args.len < 3) {
            try std.fs.File.stdout().writeAll("Error: fmt command requires a file argument\n");
            try std.fs.File.stdout().writeAll("Usage: minibaml fmt <file.baml>\n");
            return;
        }
        try formatCommand(allocator, args[2]);
    } else {
        // Default: tokenize
        try tokenizeCommand(allocator, command);
    }
}

fn printUsage() void {
    std.fs.File.stdout().writeAll(
        \\minibaml - BAML language tool
        \\
        \\Usage:
        \\  minibaml <file.baml>       Tokenize a BAML file
        \\  minibaml fmt <file.baml>   Format a BAML file
        \\
        \\Examples:
        \\  minibaml test.baml         # Show tokens
        \\  minibaml fmt test.baml     # Format and print
        \\
    ) catch {};
}

fn tokenizeCommand(allocator: std.mem.Allocator, filename: []const u8) !void {
    // Read the file
    const file = try std.fs.cwd().openFile(filename, .{});
    defer file.close();

    const source = try file.readToEndAlloc(allocator, 1024 * 1024); // Max 1MB
    defer allocator.free(source);

    // Tokenize
    var lex = minibaml.Lexer.init(source);
    var tokens = try lex.tokenize(allocator);
    defer tokens.deinit(allocator);

    // Print results
    std.debug.print("Tokenized {s}: {d} tokens\n\n", .{ filename, tokens.items.len });

    for (tokens.items, 0..) |token, i| {
        std.debug.print("{d:4}: {s:20} | Line {d:3}, Col {d:3} | \"{s}\"\n", .{
            i,
            @tagName(token.tag),
            token.line,
            token.column,
            token.lexeme,
        });
    }
}

fn formatCommand(allocator: std.mem.Allocator, filename: []const u8) !void {
    // Read the file
    const file = try std.fs.cwd().openFile(filename, .{});
    defer file.close();

    const source = try file.readToEndAlloc(allocator, 1024 * 1024); // Max 1MB
    defer allocator.free(source);

    // Tokenize
    var lex = minibaml.Lexer.init(source);
    var tokens = try lex.tokenize(allocator);
    defer tokens.deinit(allocator);

    // Parse
    var parser = minibaml.Parser.init(allocator, tokens.items);
    defer parser.deinit();

    var tree = minibaml.Ast.init(allocator);
    defer tree.deinit();

    // Parse all declarations
    while (!parser.isAtEnd()) {
        parser.skipTrivia();
        if (parser.isAtEnd()) break;

        const current = parser.peek() orelse break;

        const decl: minibaml.Declaration = switch (current.tag) {
            .keyword_class => .{ .class_decl = try parser.parseClassDecl() },
            .keyword_enum => .{ .enum_decl = try parser.parseEnumDecl() },
            .keyword_function => .{ .function_decl = try parser.parseFunctionDecl() },
            .keyword_client => .{ .client_decl = try parser.parseClientDecl() },
            .keyword_test => .{ .test_decl = try parser.parseTestDecl() },
            .keyword_generator => .{ .generator_decl = try parser.parseGeneratorDecl() },
            .keyword_template_string => .{ .template_string_decl = try parser.parseTemplateStringDecl() },
            else => {
                std.debug.print("Unexpected token: {s} at line {d}, col {d}\n", .{
                    @tagName(current.tag),
                    current.line,
                    current.column,
                });
                return error.UnexpectedToken;
            },
        };

        try tree.declarations.append(allocator, decl);
        parser.skipTrivia();
    }

    // Check for parser errors
    if (parser.errors.items.len > 0) {
        std.debug.print("Parse errors:\n", .{});
        for (parser.errors.items) |err| {
            std.debug.print("  Line {d}, Col {d}: {s}\n", .{ err.line, err.column, err.message });
        }
        return error.ParseError;
    }

    // Format
    var buffer = std.ArrayList(u8){};
    defer buffer.deinit(allocator);

    var fmt = minibaml.Formatter.init(allocator, &buffer);
    try fmt.formatAst(&tree);

    // Print formatted output
    try std.fs.File.stdout().writeAll(buffer.items);
}

test "simple test" {
    const result = 2 + 2;
    try std.testing.expectEqual(4, result);
}
