<script src="https://cdn.jsdelivr.net/npm/web3@1.5.3/dist/web3.min.js"></script>
	<script>
		window.addEventListener('load', async () => {
			if (window.ethereum) {
				window.web3 = new Web3(window.ethereum);
				await window.ethereum.enable();
			} else if (window.web3) {
				window.web3 = new Web3(window.web3.currentProvider);
			} else {
				console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
			}

			// Load transaction history from localStorage
			const savedTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
			const transactionHistory = document.getElementById('transactionHistory');
			savedTransactions.forEach(transaction => {
				const newRow = transactionHistory.insertRow();
				newRow.insertCell(0).textContent = transaction.sender;
				newRow.insertCell(1).textContent = transaction.receiver;
				newRow.insertCell(2).textContent = transaction.amount;
				newRow.insertCell(3).textContent = transaction.amountInRupees;
				newRow.insertCell(4).textContent = transaction.message;
			});
		});

		document.getElementById('transferForm').addEventListener('submit', async (event) => {
			event.preventDefault();

			const contractAddress = document.getElementById('contractAddress').value;; // Add your contract address here
			const receiver = document.getElementById('receiver').value;
			const amount = document.getElementById('amount').value;
			const message = document.getElementById('message').value;

			const contractABI = [
				{
					"anonymous": false,
					"inputs": [
						{
							"indexed": false,
							"internalType": "address",
							"name": "from",
							"type": "address"
						},
						{
							"indexed": false,
							"internalType": "address",
							"name": "to",
							"type": "address"
						},
						{
							"indexed": false,
							"internalType": "uint256",
							"name": "amount",
							"type": "uint256"
						},
						{
							"indexed": false,
							"internalType": "string",
							"name": "message",
							"type": "string"
						}
					],
					"name": "Sent",
					"type": "event"
				},
				{
					"inputs": [
						{
							"internalType": "address payable",
							"name": "_receiver",
							"type": "address"
						},
						{
							"internalType": "string",
							"name": "_message",
							"type": "string"
						}
					],
					"name": "transferEther",
					"outputs": [],
					"stateMutability": "payable",
					"type": "function"
				}
			]; // Replace with your contract ABI

			const contract = new window.web3.eth.Contract(contractABI, contractAddress);

			try {
				const accounts = await window.web3.eth.getAccounts();
				const sender = accounts[0];

				await contract.methods.transferEther(receiver, message).send({
					from: sender,
					value: window.web3.utils.toWei(amount, 'ether')
				});

				document.getElementById('transferResult').innerText = 'Ether successfully sent!';

				// Update transaction history table
				const transactionHistory = document.getElementById('transactionHistory');
				const newRow = transactionHistory.insertRow();
				newRow.insertCell(0).textContent = contractAddress; // Display contract address instead of sender
				newRow.insertCell(1).textContent = receiver;
				newRow.insertCell(2).textContent = amount;
				const amountInRupeesCell = newRow.insertCell(3);
				const amountInRupees = amount * 50000; // Assuming 1 Ether = 50000 Rupees
				amountInRupeesCell.textContent = amountInRupees;
				newRow.insertCell(4).textContent = message;

				// Save transaction to localStorage
				const savedTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
				savedTransactions.push({
					sender: contractAddress,
					receiver: receiver,
					amount: amount,
					amountInRupees: amountInRupees,
					message: message
				});
				localStorage.setItem('transactions', JSON.stringify(savedTransactions));

			} catch (error) {
				console.error('Error:', error);
				document.getElementById('transferResult').innerText = 'Error: ' + error.message;
			}
		});

	</script>
