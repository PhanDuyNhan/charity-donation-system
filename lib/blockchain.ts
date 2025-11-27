// lib/blockchain.ts
import { ethers } from 'ethers'

// Blockchain configuration
export const BLOCKCHAIN_CONFIG = {
  RPC_URL: 'https://sepolia.infura.io/v3/9ae120071a7442e999f267106f6f22c1',
  CONTRACT_ADDRESS: '0x481BeFf2ff356FD117709951470A9694F1755bbc',
  CHAIN_ID: 11155111,
  NETWORK_NAME: 'sepolia',
  ETHERSCAN_URL: 'https://sepolia.etherscan.io',
}

// Contract ABI (chỉ các function cần đọc)
export const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_projectId",
        "type": "uint256"
      }
    ],
    "name": "getProjectDonationDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "donor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "projectId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "currency",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "transactionCode",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "paymentMethod",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct CharityTransactions.Donation[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalDonations",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

// Donation type from blockchain
export interface BlockchainDonation {
  id: bigint
  donor: string
  projectId: bigint
  amount: bigint
  currency: string
  transactionCode: string
  paymentMethod: string
  timestamp: bigint
  exists: boolean
}

// Formatted donation for display
export interface FormattedBlockchainDonation {
  id: number
  donor: string
  donorShort: string
  projectId: number
  amount: number
  currency: string
  transactionCode: string
  paymentMethod: string
  timestamp: Date
  timestampFormatted: string
}

// Get provider
export function getProvider() {
  return new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.RPC_URL)
}

// Get contract instance
export function getContract() {
  const provider = getProvider()
  return new ethers.Contract(
    BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  )
}

// Format address to short form
export function shortenAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format timestamp to Vietnamese date
export function formatBlockchainDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Get Etherscan link for address
export function getEtherscanAddressLink(address: string): string {
  return `${BLOCKCHAIN_CONFIG.ETHERSCAN_URL}/address/${address}`
}

// Get Etherscan link for transaction
export function getEtherscanTxLink(txHash: string): string {
  return `${BLOCKCHAIN_CONFIG.ETHERSCAN_URL}/tx/${txHash}`
}

// Get all donations for a project from blockchain using getProjectDonationDetails
export async function getProjectDonationsFromBlockchain(
  projectId: number
): Promise<FormattedBlockchainDonation[]> {
  try {
    const contract = getContract()

    // Gọi trực tiếp getProjectDonationDetails để lấy tất cả donations của project
    const donationsRaw: BlockchainDonation[] = await contract.getProjectDonationDetails(projectId)

    if (!donationsRaw || donationsRaw.length === 0) {
      return []
    }

    // Format donations
    const donations: FormattedBlockchainDonation[] = donationsRaw
      .filter((d) => d.exists)
      .map((donation) => ({
        id: Number(donation.id),
        donor: donation.donor,
        donorShort: shortenAddress(donation.donor),
        projectId: Number(donation.projectId),
        amount: Number(donation.amount),
        currency: donation.currency,
        transactionCode: donation.transactionCode,
        paymentMethod: donation.paymentMethod,
        timestamp: new Date(Number(donation.timestamp) * 1000),
        timestampFormatted: formatBlockchainDate(donation.timestamp),
      }))

    // Sort by timestamp descending (newest first)
    donations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return donations
  } catch (error) {
    console.error('Error fetching blockchain donations:', error)
    throw error
  }
}

// Get total donations count from blockchain
export async function getTotalDonationsCount(): Promise<number> {
  try {
    const contract = getContract()
    const total = await contract.totalDonations()
    return Number(total)
  } catch (error) {
    console.error('Error fetching total donations:', error)
    return 0
  }
}
