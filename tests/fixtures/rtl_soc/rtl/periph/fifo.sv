// Synchronous FIFO.
module fifo #(parameter W = 8, parameter D = 16) (
  input  logic         clk, rst_n,
  input  logic [W-1:0] wdata,
  input  logic         push, pop,
  output logic [W-1:0] rdata,
  output logic         full, empty,
  axi_if.slave         cfg
);
endmodule
