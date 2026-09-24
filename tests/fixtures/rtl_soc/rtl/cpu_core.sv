/* Five-stage in-order CPU core. */
module cpu_core (input logic clk, input logic rst_n);
  alu u_alu (.a(), .b());
  regfile #(32) u_rf (.clk(clk));
endmodule

module alu (input logic [31:0] a, input logic [31:0] b);
endmodule
