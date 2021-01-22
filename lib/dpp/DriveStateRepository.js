const DataContract = require('@dashevo/dpp/lib/dataContract/DataContract');
const { decode } = require('@dashevo/dpp/lib/util/serializer');

/**
 * @implements StateRepository
 */
class DriveStateRepository {
  /**
   * @param {DriveClient} driveClient
   */
  constructor(driveClient) {
    this.driveClient = driveClient;
  }

  /**
   * Fetches data contract from Drive
   * @param {Identifier} contractIdentifier
   * @return {Promise<DataContract>}
   */
  async fetchDataContract(contractIdentifier) {
    const driveResponse = await this.driveClient.fetchDataContract(
      contractIdentifier, false,
    );

    return new DataContract(decode(driveResponse.data));
  }
}

module.exports = DriveStateRepository;
