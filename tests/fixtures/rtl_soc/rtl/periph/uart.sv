// UART with 16-byte FIFOs on both directions.
module uart (input logic clk, output logic tx);
  fifo u_tx_fifo (.clk(clk));
  fifo u_rx_fifo (.clk(clk));
endmodule
