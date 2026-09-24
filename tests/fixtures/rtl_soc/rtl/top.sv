// -----------------------------------------------------------------------------
// File: top.sv
// Author: demo
// Description: SoC top level that ties the CPU, the bus and the peripherals together.
// -----------------------------------------------------------------------------
`include "defs.svh"
module soc_top (
  input  logic clk,
  input  logic rst_n,
  output logic uart0_tx
);
  import soc_pkg::*;
  logic [31:0] bus;
  cpu_core u_cpu (.clk(clk), .rst_n(rst_n));
  axi_xbar #(.N(4), .W($clog2(8))) u_xbar (
    .clk (clk)
  );
  uart u_uart0 (.clk(clk), .tx(uart0_tx));
  uart u_uart1 (.clk(clk), .tx());
  sky130_sram_1kbyte u_mem (.clk0(clk));
  always_ff @(posedge clk) begin
    if (rst_n) bus <= '0;
  end
  assert property (@(posedge clk) rst_n |-> 1);
endmodule
